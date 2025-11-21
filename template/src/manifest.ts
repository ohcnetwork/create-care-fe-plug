import routes from "./routes";

const manifest = {
  plugin: "{{PROJECT_NAME_KEBAB}}",
  routes,
  extends: [],
  components: {},
  devices: [],
} as const;

export default manifest;
