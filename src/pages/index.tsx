/* eslint-disable */

import type { InferGetServerSidePropsType, NextApiResponse } from "next";
import Head from "next/head";

import { useState } from "react";
import Select from "react-select";
import { powerlink } from "../core/powerlink";

type Data = {
  ambs: Array<{ value: string; label: string }>;
  campaign: string;
  amb: string | null;
};

export const getServerSideProps = async ({
  query,
}: {
  res: NextApiResponse;
  query: Record<string, string>;
}) => {
  const data: Data = {
    amb: query.amb ?? null,
    campaign: query.id ?? "177b5cd5-2a69-4933-992e-1dd3599eb77e",
    ambs: await powerlink(
      query.id ?? "177b5cd5-2a69-4933-992e-1dd3599eb77e",
      query.amb
    ),
  };
  return { props: { data } };
};

const Home = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const mosadId = "7001671";
  const [amb, setAmb] = useState<string>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [dedication, setDedication] = useState("");
  const [amount, setAmount] = useState(1);

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmitEv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch(
      "https://www.matara.pro/nedarimplus/V6/Files/WebServices/DebitBit.aspx?Action=CreateTransaction",
      {
        method: "POST",
        body: new URLSearchParams({
          Groupe: `${anonymous},${data.campaign},${amb}`,
          MosadId: mosadId,
          ClientName: fullName,
          Phone: phoneNumber,
          Amount: amount.toString(),
          Mail: email,
          Tashlumim: "1",
          Currency: "1",
          Comment: dedication,
        }),
      }
    );

    const json = await res.json();

    if (json.Status === "OK") {
      window.location = json.Message;
    } else {
      setErrorMessage(json.Message);
    }

    /**
     *  campaign
     *  amb
     *  fullName
     *  email
     *  phoneNumber
     *  anonymous
     *  dedication
     */
    //
    // window.location.href = `https://secure.cardcom.solutions/e/kRGe0T0JvEyRfy98wAxBxA?sum=${amount}&custom_field_01=${
    //   data.campaign
    // }&custom_field_02=${amb}&subscribers_name=${encodeURIComponent(
    //   fullName
    // )}&subscribers_email=${encodeURIComponent(
    //   email
    // )}&subscribers_phone=${encodeURIComponent(
    //   phoneNumber
    // )}&custom_field_06=${encodeURIComponent(
    //   anonymous
    // )}&custom_field_07=${encodeURIComponent(
    //   dedication
    // )}&NotifyURL=https://hook.eu1.make.com/ydyx12ru31txv5b82aw6w1c91eeadtcy
    // `;
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        dir="rtl"
        id="donation-form"
        className="rounded-lg bg-white p-6"
        onSubmit={onSubmitEv}
      >
        <h2 className="mb-4 text-lg font-medium">טופס תרומה</h2>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">שגריר</label>
          {data.amb ? (
            <>
              <input
                value={data.ambs[0]?.label}
                readOnly
                className="w-full rounded-lg border border-gray-400 p-2"
              />
              <input name="amb" value={data.ambs[0]?.value} hidden readOnly />
            </>
          ) : (
            <Select options={data.ambs} onChange={(v) => setAmb(v?.value)} />
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">
            שם מלא <span className="text-red-700">*</span>
          </label>
          <input
            required
            value={fullName}
            className="w-full rounded-lg border border-gray-400 p-2"
            type="text"
            onChange={(ev) => setFullName(ev.target.value)}
            name="full_name"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">סכום</label>
          <div className="flex">
            <input
              className="w-full rounded-r-lg border border-gray-400 p-2"
              type="number"
              name="amount"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              placeholder="כתוב את הסכום של התרומה"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">
            דואר אלקטרוני
          </label>
          <input
            className="w-full rounded-lg border border-gray-400 p-2"
            type="email"
            name="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="כתוב את כתובת הדואר האלקטרוני שלך"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">
            טלפון נייד
          </label>
          <input
            required
            className="w-full rounded-lg border border-gray-400 p-2"
            type="tel"
            value={phoneNumber}
            onChange={(ev) => setPhoneNumber(ev.target.value)}
            name="phone"
            placeholder="כתוב את מספר הטלפון הנייד שלך"
          />
        </div>
        <div className="mb-4 flex justify-start">
          <input
            className=" rounded-lg border border-gray-400"
            type="checkbox"
            defaultChecked={anonymous}
            onChange={() => setAnonymous((prev) => !prev)}
            name="anonymous"
          />
          <label className="mx-2 block font-medium text-gray-700">
            תרומה אנונימית
          </label>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-700">הקדשה</label>
          <textarea
            className="h-36 w-full rounded-lg border border-gray-400 p-2"
            name="dedication"
            value={dedication}
            onChange={(ev) => setDedication(ev.target.value)}
          />
        </div>

        <button className="w-full rounded-lg bg-indigo-500 py-2 px-4 text-white hover:bg-indigo-600">
          תרום
        </button>

        <label className="text-red-800" >{errorMessage}</label>
      </form>
    </>
  );
};

export default Home;
