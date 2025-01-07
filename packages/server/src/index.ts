import express from "express";
import type { Express } from "express";
import cors from "cors";

import { initRouter } from "@server/routes";
import { loadConfig } from "@server/utils/config";
import { initPrisma } from "@server/utils/db";

loadConfig();
initPrisma();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  console.log(req.method, req.url, req.params, req.query, req.body);
  next();
});

initRouter(app);

// 获取注册的路由
const getRoutes = (app: Express) => {
  const routes: { path: string; methods: string }[] = [];
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      // 如果是路由
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      routes.push({ path, methods });
    } else if (layer.name === "router") {
      // 如果是嵌套路由
      layer.handle.stack.forEach((nestedLayer) => {
        if (nestedLayer.route) {
          const path = nestedLayer.route.path;
          const methods = Object.keys(nestedLayer.route.methods)
            .join(", ")
            .toUpperCase();
          routes.push({ path, methods });
        }
      });
    }
  });
  return routes;
};

app.use((req, res) => {
  console.log("404", req.url);
  res.status(404).send("404");
});

app.listen(process.app.config.port, () => {
  console.log(`Server is running on port ${process.app.config.port}`);
  console.log(getRoutes(app));
});
