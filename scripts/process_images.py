from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from statistics import median

from PIL import Image, ImageDraw


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tif", ".tiff"}
DEFAULT_DOT_COLOR = (255, 59, 48, 255)


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Recursively resize images under an input directory to a fixed height, "
            "then draw a marker near the top-right of the detected subject area."
        )
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("input"),
        help="Input root directory. Default: ./input",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("output"),
        help="Output root directory. Default: ./output",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=843,
        help="Target image height in pixels. Default: 843",
    )
    parser.add_argument(
        "--keep-size",
        action="store_true",
        help="Keep the original image size and only compute the anchor / marker.",
    )
    parser.add_argument(
        "--dot-radius",
        type=int,
        default=0,
        help="Marker radius in pixels. Default: auto",
    )
    parser.add_argument(
        "--write-tiled",
        action="store_true",
        help="Also write a Tiled .tmj file with a point object at the detected top-right anchor.",
    )
    return parser.parse_args()


def iter_images(root: Path):
    if root.is_file() and root.suffix.lower() in SUPPORTED_EXTENSIONS:
        yield root
        return

    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def resize_to_height(image: Image.Image, target_height: int) -> Image.Image:
    if image.height == target_height:
        return image.copy()

    target_width = max(1, round(image.width * target_height / image.height))
    return image.resize((target_width, target_height), Image.Resampling.LANCZOS)


def sample_background(rgb_image: Image.Image) -> tuple[float, float, float]:
    width, height = rgb_image.size
    sample_points = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
        (width // 2, 0),
        (width // 2, height - 1),
        (0, height // 2),
        (width - 1, height // 2),
    ]

    channels = [[], [], []]
    for x, y in sample_points:
        r, g, b = rgb_image.getpixel((x, y))
        channels[0].append(r)
        channels[1].append(g)
        channels[2].append(b)

    return tuple(float(median(channel)) for channel in channels)


def build_foreground_mask(image: Image.Image) -> list[tuple[int, int]]:
    rgba_image = image.convert("RGBA")
    rgb_image = rgba_image.convert("RGB")
    background = sample_background(rgb_image)
    width, height = rgba_image.size
    points: list[tuple[int, int]] = []
    alpha_extrema = rgba_image.getchannel("A").getextrema()
    has_transparency = alpha_extrema is not None and alpha_extrema[0] < 255

    for y in range(height):
        for x in range(width):
            r, g, b, a = rgba_image.getpixel((x, y))
            if has_transparency:
                if a > 10:
                    points.append((x, y))
                continue

            distance = math.sqrt(
                (r - background[0]) ** 2
                + (g - background[1]) ** 2
                + (b - background[2]) ** 2
            )

            if distance >= 28 or a >= 245:
                points.append((x, y))

    return points


def subject_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    points = build_foreground_mask(image)
    width, height = image.size

    if not points:
        return (0, 0, width - 1, height - 1)

    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    return (min(xs), min(ys), max(xs), max(ys))


def marker_position(
    bbox: tuple[int, int, int, int],
    radius: int,
    image_size: tuple[int, int],
) -> tuple[int, int]:
    _, top, right, _ = bbox
    return right, top


def draw_marker(image: Image.Image, bbox: tuple[int, int, int, int], radius: int) -> Image.Image:
    rgba_image = image.convert("RGBA")
    draw = ImageDraw.Draw(rgba_image)
    x, y = marker_position(bbox, radius, rgba_image.size)

    draw.ellipse(
        (x - radius, y - radius, x + radius, y + radius),
        fill=DEFAULT_DOT_COLOR,
    )
    return rgba_image


def write_tiled_map(
    destination_image: Path,
    image_size: tuple[int, int],
    marker_xy: tuple[int, int],
) -> None:
    width, height = image_size
    x, y = marker_xy
    tiled_map = {
        "compressionlevel": -1,
        "height": height,
        "infinite": False,
        "layers": [
            {
                "draworder": "topdown",
                "id": 1,
                "name": "anchors",
                "objects": [
                    {
                        "height": 0,
                        "id": 1,
                        "name": "anchor_top_right",
                        "point": True,
                        "rotation": 0,
                        "type": "anchor",
                        "visible": True,
                        "width": 0,
                        "x": x,
                        "y": y,
                    }
                ],
                "opacity": 1,
                "type": "objectgroup",
                "visible": True,
                "x": 0,
                "y": 0,
            },
            {
                "id": 2,
                "image": destination_image.name,
                "imageheight": height,
                "imagewidth": width,
                "name": "image",
                "opacity": 1,
                "type": "imagelayer",
                "visible": True,
                "x": 0,
                "y": 0,
            },
        ],
        "nextlayerid": 3,
        "nextobjectid": 2,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": "1.11.0",
        "tileheight": 1,
        "tilesets": [],
        "tilewidth": 1,
        "type": "map",
        "version": "1.10",
        "width": width,
    }

    tmj_path = destination_image.with_suffix(".tmj")
    tmj_path.write_text(json.dumps(tiled_map, ensure_ascii=False, indent=2), encoding="utf-8")


def save_image(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.suffix.lower() in {".jpg", ".jpeg"}:
        image.convert("RGB").save(destination, quality=95)
    else:
        image.save(destination)


def process_one(
    source: Path,
    input_root: Path,
    output_root: Path,
    target_height: int,
    dot_radius: int,
    write_tiled: bool,
    keep_size: bool,
) -> None:
    with Image.open(source) as image:
        resized = image.copy() if keep_size else resize_to_height(image, target_height)
        bbox = subject_bbox(resized)
        marker_xy = marker_position(bbox, 0, resized.size)
        auto_radius = max(6, round(min(resized.width, resized.height) * 0.012))
        marked = draw_marker(resized, bbox, dot_radius or auto_radius)

    relative_path = source.name if input_root.is_file() else source.relative_to(input_root)
    destination = output_root / relative_path
    save_image(marked, destination)
    if write_tiled:
        write_tiled_map(destination, marked.size, marker_xy)


def main() -> None:
    args = parse_args()
    input_root = args.input.resolve()
    output_root = args.output.resolve()

    if not input_root.exists():
        raise SystemExit(f"Input directory does not exist: {input_root}")

    image_paths = list(iter_images(input_root))
    if not image_paths:
        raise SystemExit(f"No supported images found under: {input_root}")

    processed = 0
    for source in image_paths:
        process_one(source, input_root, output_root, args.height, args.dot_radius, args.write_tiled, args.keep_size)
        processed += 1
        label = source.name if input_root.is_file() else source.relative_to(input_root)
        print(f"[{processed}/{len(image_paths)}] {label}")

    print(f"Done. Processed {processed} image(s) into: {output_root}")


if __name__ == "__main__":
    main()
