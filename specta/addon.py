import os
from pathlib import Path
import shutil

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

        src = self.static_path / "build"
        dest = self.manager.output_dir / "build"

        for item in os.listdir(src):
            s = os.path.join(src, item)
            d = os.path.join(dest, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d)        

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
