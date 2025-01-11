import { HttpClient } from "@qupidjs/httpclient";
import { GetUserStepsEndpoint } from "@qupidjs/types/api";

class UserStepsClient extends HttpClient {
  constructor() {
    super(window.app.config.baseUrl);
  }

  async getUserSteps() {
    return this.do<GetUserStepsEndpoint>({
      method: "GET",
      path: "/user-steps",
      authToken: "token",
    });
  }
}

export const userStepsClient = new UserStepsClient();
