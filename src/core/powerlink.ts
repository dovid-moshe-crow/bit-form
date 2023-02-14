import axios from "axios";

let lastId = "";
let lastAmbs: string | undefined = "";
let lastResult: Array<{ value: string; label: string }> = [];
let lastRequestTime = 0;

export async function powerlink(
  campaignId: string,
  ambsId?: string
): Promise<Array<{ value: string; label: string }>> {
  if (
    campaignId === lastId &&
    ambsId == lastAmbs &&
    Date.now() - lastRequestTime < 3 * 60 * 1000
  ) {
    console.log("cached");
    return lastResult;
  }
  try {

    console.log(`(pcfsystemfield326 = ${campaignId})${
      ambsId ? " and \n(customobject1020id = " + ambsId : ")"
    })`)
    const result = await axios.post(
      "https://api.powerlink.co.il/api/query",
      {
        objecttype: "1020",
        sort_type: "desc",
        fields: "pcfsystemfield333,pcfsystemfield326,customobject1020id",
        query: `(pcfsystemfield326 = ${campaignId})${
          ambsId ? " AND (customobject1020id = " + ambsId : ")"
        })`,
      },
      {
        headers: {
          "Content-type": "application/json",
          tokenId: process.env.POWERLINK_TOKEN_ID,
        },
        timeout: 4000,
      }
    );

    console.log(result.data.data.Data);

    lastId = campaignId;
    lastAmbs = ambsId;
    lastResult = result.data["data"]["Data"].map(
      (x: Record<string, string>) => {
        return {
          value: x["customobject1020id"],
          label: x["pcfsystemfield333"],
        };
      }
    );
    lastRequestTime = Date.now();
    return lastResult;
  } catch {
    return [];
  }
}
