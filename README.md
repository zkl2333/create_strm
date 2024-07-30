# create_strm
仅支持全量生成

```yaml
version: '3.8'

services:
  media-strm-creator:
    image: ghcr.io/zkl2333/create_strm:main
    container_name: media-strm-creator
    volumes:
      - /volume1/CloudNAS:/CloudNAS
      - /volume1/共享文件/影音:/Media
    environment:
      - STRM_MODE=remote
      - SOURCE_PATH=/CloudNAS/115/资源合集/XXX
      - REMOTE_URL=http://192.168.31.32:8998/资源合集/XXX/
      - TARGET_PATH=/Media/xxxStrm/资源合集
      - OVERWRITE=true
```