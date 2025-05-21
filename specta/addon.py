from pathlib import Path
from jupyterlite_core.addons.base import BaseAddon


class SpectaAddon(BaseAddon):
    """The Specta app"""

    __all__ = ["post_build"]

    @property
    def output_files_dir(self):
        return self.manager.output_dir / "files"

    @property
    def static_path(self):
        return Path(__file__).resolve().parent / "static"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def post_build(self, *args, **kwargs):
        """Post-build hook"""
        self.log.info("Running post-build hook for Specta")

        # Copy static assets
        yield dict(
            name="specta:copy:specta:build",
            actions=[
                (
                    self.copy_one,
                    [
                        self.static_path / "build" / "specta",
                        self.manager.output_dir / "build" / "specta",
                    ],
                )
            ],
        )

        yield dict(
            name="specta:copy:specta:assets",
            actions=[
                (
                    self.copy_one,
                    [
                        self.static_path / "build" / "specta_build_index_js.js",
                        self.manager.output_dir / "build" / "specta_build_index_js.js",
                    ],
                )
            ],
        )

        for f in ["index.html", "jupyter-lite.json", "jupyter-lite.ipynb"]:
            yield dict(
                name=f"specta:copy:specta:{f}",
                actions=[
                    (
                        self.copy_one,
                        [
                            self.static_path / f,
                            self.manager.output_dir / "specta" / f,
                        ],
                    )
                ],
            )
