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
  Container,
  TextInput,
} from "@mantine/core";
import { powerlink } from "../core/powerlink";
import Amount from "../Components/Amount";


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

  const { Mosad1, Mosad2, Multiplier } = router.query;

  const multiplier = parseInt(typeof Multiplier == "string" ? Multiplier : "1");

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

  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState("ils");
  const [multiSub, setMultiSub] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

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

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    var formData = new FormData(e.target as any);
    const formProps = Object.fromEntries(formData);

    const nedarim = (document.getElementById("nedarim") as HTMLIFrameElement)
      .contentWindow;

    console.log({
      Mosad: paymentOptions[formProps.cardType?.toString() ?? ""]?.mosadId,
      ApiValid: paymentOptions[formProps.cardType?.toString() ?? ""]?.apiValid,
      Param2: formProps.dedication,
      Street: formProps.address,
      FirstName: formProps.full_name,
      City: formProps.city,
      Mail: formProps.email,
      Phone: formProps.phone,
      Param1: `${formProps.anonymous == "on"},${data.amb ?? formProps.amb}`,
      Comment: `${data.campaign}`,
      Tashlumim: formProps.payments == "0" ? "" : formProps.payments,
      Amount: formProps.amount,
      Currency: formProps.currency == "ils" ?  1 : 2,
      PaymentType: formProps.payments == "1" ? "Ragil" : "HK",
      Zeout: "",
      LastName: "",
      Groupe: "",
      ForceUpdateMatching: "1",
    });

    if (!nedarim) return;

    nedarim.postMessage(
      {
        Name: "FinishTransaction2",
        Value: {
          Mosad: paymentOptions[formProps.cardType?.toString() ?? ""]?.mosadId,
          ApiValid:
            paymentOptions[formProps.cardType?.toString() ?? ""]?.apiValid,
          Param2: formProps.dedication,
          Street: formProps.address,
          FirstName: formProps.full_name,
          City: formProps.city,
          Mail: formProps.email,
          Phone: formProps.phone,
          Param1: `${formProps.anonymous == "on"},${
            data.amb ?? formProps.amb
          },${multiplier}`,
          Comment: `${data.campaign}`,
          Tashlumim: formProps.payments == "0" ? "" : formProps.payments,
          Amount: formProps.amount,
          Currency: 1,
          PaymentType: formProps.payments == "1" ? "Ragil" : "HK",
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
          <Select label="שגריר" searchable data={data.ambs} name="amb" />
        )}

        <TextInput name="full_name" required label="שם מלא" />
        <TextInput name="email" type="email" label="דואר אלקטרוני" />
        <TextInput name="phone" type="tel" label="טלפון נייד" />
        <TextInput name="address" type="text" label="כתובת" />
        <TextInput name="city" type="text" label="עיר" />
        <Amount
          currency={currency}
          setCurrency={setCurrency}
          label="סכום"
          multiplier={multiplier}
          amount={amount}
          setAmount={setAmount}
        />

        <Checkbox
          label="תרומה חוזרת"
          defaultChecked={multiSub}
          checked={multiSub}
          onChange={() => setMultiSub((prev) => !prev)}
        />

        {multiSub ? (
          <Select
            name="payments"
            label="מספר תרומות"
            defaultValue="12"
            data={[
              { value: "0", label: "ללא הגבלה" },
              ...new Array(24)
                .fill(0)
                .map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` })),
            ]}
          />
        ) : (
          <TextInput type="hidden" name="payments" value={1} />
        )}

        <Checkbox
          label="תרומה אנונימית"
          name="anonymous"
          defaultChecked={false}
        />

        <Textarea name="dedication" label="הקדשה" maxLength={55} />

        <Select
          label="סוג כרטיס"
          defaultValue={Object.keys(paymentOptions)[0]}
          data={Object.keys(paymentOptions)}
          name="cardType"
        />

        <iframe
          src={`https://www.matara.pro/nedarimplus/iframe/`}
          height={320}
          id="nedarim"
        ></iframe>

        <Container>
          <Text>תחויב בסכום של</Text>
        </Container>

        <Text color="red">{errorMessage}</Text>

        <Button type="submit">תרום</Button>
      </Stack>
    </form>
  );
};


export default Home;
