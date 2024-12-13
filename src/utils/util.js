import api from "@forge/api";

export async function checkAPIStatus(response) {
  if (!response.ok) {
    console.log(response.ok);
    const message = "Error from Jira";
    console.log(message);
    throw new Error(message);
  }

  return response;
}
