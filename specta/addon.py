import os
from pathlib import Path
import re
import shutil
import json

from jupyterlite_core.addons.base import BaseAddon

NO_LOADING_SCREEN = os.getenv("SPECTA_NO_LOADING_SCREEN", None)


class SpectaAddon(BaseAddon):
    """The Specta app"""

    __all__ = ["post_build"]

    @property
    def output_files_dir(self):
        return self.manager.output_dir / "files"

    @property
    def static_path(self):
        return Path(__file__).resolve().parent / "app_static"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def update_index(self) -> None:
        """Update index html to change the loading name"""
        loading_name = None

        with open(self.manager.output_dir / "jupyter-lite.json", "r") as f:
            config = json.loads(f.read())
            try:
                loading_name = config["jupyter-config-data"]["spectaConfig"][
                    "loadingName"
                ]
            except KeyError:
                loading_name = "Loading Specta"

        index_path = self.manager.output_dir / "specta" / "index.html"
        with open(index_path, "r") as f:
            if NO_LOADING_SCREEN is not None:
                cleaned_lines = []
                # Remove all text between <!-- START_SPECTA_LOADING_SCREEN --> and  <!-- END_SPECTA_LOADING_SCREEN -->
                skip = False
                all_lines = f.read().splitlines()
                for line in all_lines:
                    if "<!-- START_SPECTA_LOADING_SCREEN -->" in line:
                        skip = True

                    if "<!-- END_SPECTA_LOADING_SCREEN -->" in line:
                        skip = False

                    if not skip and "<!-- END_SPECTA_LOADING_SCREEN -->" not in line:
                        cleaned_lines.append(line)
                content = "\n".join(cleaned_lines)

            else:
                content = f.read()
                content = content.replace("#SPECTA_LOADING_NAME#", loading_name)

        with open(index_path, "w") as f:
            f.write(content)

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

        yield dict(
            name="specta:copy:static",
            actions=[
                (
                    self.copy_one,
                    [
                        self.static_path / "specta",
                        self.manager.output_dir / "specta",
                    ],
                ),
                (self.update_index),
            ],
        )
