/* eslint-disable */

import { NextApiResponse, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  NativeSelect,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
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
  const router = useRouter();

  const { Mosad1, Mosad2 } = router.query;

  let paymentOptions: Record<string, { mosadId: string; apiValid: string }> =
    {};

  if (typeof Mosad1 == "string") {
    const mosad1 = Mosad1.split(",");
    paymentOptions[mosad1[0]!] = {
      apiValid: mosad1[1]!,
      mosadId: mosad1[2]!,
    };
  }

  if (typeof Mosad2 == "string") {
    const mosad2 = Mosad2.split(",");
    paymentOptions[mosad2[0]!] = {
      apiValid: mosad2[1]!,
      mosadId: mosad2[2]!,
    };
  }

  const [mosadName, setMosadName] = useState(Object.keys(paymentOptions)[0]!);
  const [amb, setAmb] = useState<string | undefined>(data.amb ?? undefined);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [dedication, setDedication] = useState("");
  const [amount, setAmount] = useState(1);
  const [payments, setPayments] = useState(1);
  const [multiSub, setMultiSub] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const readPostMessage = (e: MessageEvent<any>) => {
      if (e.data.Name == "TransactionResponse") {
        console.log(e);
        if (e.data.Value.Status == "Error") {
          setErrorMessage(e.data.Value.Message);
        } else {
          window.location.href = "https://yeshivatcy.co.il/";
        }
      }
    };
    window.addEventListener("message", readPostMessage, false);

    return () => {
      window.removeEventListener("message", readPostMessage);
    };
  });

  useEffect(() => {
    if (multiSub) {
      setPayments(12);
    } else {
      setPayments(1);
    }
  }, [multiSub]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    const nedarim = (document.getElementById("nedarim") as HTMLIFrameElement)
      .contentWindow;

    if (!nedarim) return;

    nedarim.postMessage(
      {
        Name: "FinishTransaction2",
        Value: {
          Mosad: paymentOptions[mosadName]?.mosadId,
          ApiValid: paymentOptions[mosadName]?.apiValid,
          Param2: dedication,
          Street: address,
          FirstName: fullName,
          City: city,
          Mail: email,
          Phone: phoneNumber,
          Param1: `${anonymous},${data.amb ?? amb}`,
          Comment: `${data.campaign}`,
          Tashlumim: payments == 0 ? "" : payments,
          Amount: amount,
          Currency: 1,
          PaymentType: payments == 1 ? "Ragil" : "HK",
          Zeout: "",
          LastName: "",
          Groupe: "",
          ForceUpdateMatching: "1",
        },
      },
      "*"
    );
  };

  return (
    <form dir="rtl" className="p-6" onSubmit={submit}>
      <Stack>
        <TextInput type="hidden" name="campaign" value={data.campaign} />
        {data.amb ? (
          <>
            <TextInput name="amb" value={data.ambs[0]?.label} readOnly />
          </>
        ) : (
          <Select
            label="שגריר"
            searchable
            data={data.ambs}
            onChange={(e) => setAmb(e ?? "")}
            name="amb"
          />
        )}

        <TextInput
          name="full_name"
          required
          label="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextInput
          name="email"
          type="email"
          label="דואר אלקטרוני"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          name="phone"
          type="tel"
          label="טלפון נייד"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <TextInput
          name="address"
          type="text"
          label="כתובת"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextInput
          name="city"
          type="text"
          label="עיר"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <NumberInput
          required
          min={1}
          name="amount"
          label="סכום"
          value={amount}
          onChange={(num) => setAmount(num ?? 1)}
        />
        <Checkbox
          label="תרומה חוזרת"
          defaultChecked={multiSub}
          checked={multiSub}
          onChange={() => setMultiSub((prev) => !prev)}
        />

        {multiSub ? (
          <Select
            name="months"
            label="מספר תרומות"
            defaultValue={payments.toString()}
            value={payments.toString()}
            data={[
              { value: "0", label: "ללא הגבלה" },
              ...new Array(24)
                .fill(0)
                .map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` })),
            ]}
            onChange={(e) => setPayments(parseInt(e ?? "1"))}
          />
        ) : (
          <TextInput type="hidden" name="months" value={1} />
        )}

        <Checkbox
          label="תרומה אנונימית"
          name="anonymous"
          checked={anonymous}
          onChange={() => setAnonymous((prev) => !prev)}
        />

        <Textarea
          name="dedication"
          label="הקדשה"
          value={dedication}
          maxLength={55}
          onChange={(e) => setDedication(e.target.value)}
        />

        <Select
          label="סוג כרטיס"
          defaultValue={mosadName}
          data={Object.keys(paymentOptions)}
          onChange={(e) => setMosadName(e ?? "")}
          name="cardType"
        />

        <iframe
          src={`https://www.matara.pro/nedarimplus/iframe/`}
          height={320}
          id="nedarim"
        ></iframe>

        <Text color="red">{errorMessage}</Text>

        <Button type="submit">תרום</Button>
      </Stack>
    </form>
  );
};

export function CurrencyInput({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const data = [{ value: "ils", label: "🇮🇱 ILS" }];
  const select = (
    <NativeSelect
      data={data}
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      }}
    />
  );

  return (
    <TextInput
      type="number"
      min={1}
      required
      name={name}
      label={label}
      rightSection={select}
      rightSectionWidth={92}
    />
  );
}

export default Home;
