import { describe, expect, test } from "bun:test";
import axios from "axios";
import { shouldRetrySocialLogin } from "./social-login-retry";

describe("shouldRetrySocialLogin", () => {
  test("retries transient gateway and timeout failures", () => {
    expect(
      shouldRetrySocialLogin(new axios.AxiosError("timeout", "ECONNABORTED")),
    ).toBe(true);

    const gatewayError = new axios.AxiosError("gateway timeout");
    gatewayError.response = {
      status: 504,
      statusText: "Gateway Timeout",
      headers: {},
      config: gatewayError.config!,
      data: null,
    };
    expect(shouldRetrySocialLogin(gatewayError)).toBe(true);
  });

  test("does not retry validation or authentication failures", () => {
    const unauthorized = new axios.AxiosError("unauthorized");
    unauthorized.response = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: unauthorized.config!,
      data: null,
    };
    expect(shouldRetrySocialLogin(unauthorized)).toBe(false);
    expect(shouldRetrySocialLogin(new Error("unexpected"))).toBe(false);
  });
});
