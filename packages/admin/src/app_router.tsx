import { Fragment } from "react";
import { Route, Routes } from "react-router";
import { ModelHttpClient } from "@qupidjs/httpclient";
import { models } from "@server/db/models";
import { Home } from "./home";
import { ListView } from "./views/list";
import { Layout } from "./layout";
import { EditView } from "./views/edit";
import { CreateView } from "./views/create";
import { NotFound } from "./not_found";
import { SearchView } from "./views/search";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        {models.map((model) => {
          const client = new ModelHttpClient({
            baseUrl: window.app.config.baseUrl,
            prefix: model.modelRoutePrefix,
          });

          return (
            <Fragment key={model.modelRoutePrefix}>
              <Route
                path={`${model.modelRoutePrefix}`}
                element={
                  <ListView
                    key={`${model.modelRoutePrefix}`}
                    model={model}
                    client={client}
                  />
                }
              />
              <Route
                path={`${model.modelRoutePrefix}/search`}
                element={
                  <SearchView
                    key={`${model.modelRoutePrefix}/serach`}
                    model={model}
                    client={client}
                  />
                }
              />
              <Route
                path={`${model.modelRoutePrefix}/:id`}
                element={
                  <EditView
                    key={`${model.modelRoutePrefix}/:id`}
                    model={model}
                    client={client}
                  />
                }
              />
              <Route
                path={`${model.modelRoutePrefix}/create`}
                element={
                  <CreateView
                    key={`${model.modelRoutePrefix}/create`}
                    model={model}
                    client={client}
                  />
                }
              />
            </Fragment>
          );
        })}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
