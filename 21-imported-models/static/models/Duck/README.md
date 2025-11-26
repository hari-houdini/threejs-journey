# Duck
## Screenshot

![screenshot](screenshot/screenshot.png)

## Formats (not exclusive)

### GLTF - Default
- GLTF - JSON that contains info regarding cameras, lights, scenes, materials, object transformations, but not geometries and textures
- BIN - Binary file that contains info geometry info (vertices, uv coordinates, normals, colors, etc)
- PNG - Texture image

### GLTF - Binary
- GLB - GLTF Binary that contains all the above data in a single file

### GLTF - Draco
- Like GLTF Default but buffer data is compressed using "Draco" algorithm

### GLTF - Embedded
- Like GLTF Binary, but in GLTF format (heavier)

## When to use which?

- Depends on how we want to handle assets
- To have ability to modify, go for "GLTF-Default" - Sometimes Loading multiple files are better
- If single file works, go for "GLTF-Binary"

## License Information

Copyright 2006 Sony Computer Entertainment Inc.

Licensed under the SCEA Shared Source License, Version 1.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:

http://research.scea.com/scea_shared_source_license.html

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.