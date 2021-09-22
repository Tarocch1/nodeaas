docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7,linux/ppc64le,linux/s390x \
  -t tarocch1/nodeaas:latest \
  -t registry.cn-hongkong.aliyuncs.com/tarocch1/nodeaas:latest \
  --push \
  .
