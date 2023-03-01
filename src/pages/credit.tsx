/* eslint-disable */

import { NextApiResponse, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Checkbox, NativeSelect, NumberInput, Select, Stack, Textarea, TextInput } from "@mantine/core"
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

    const { Mosad, ApiValid } = router.query;
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
        if (multiSub) {
            setPayments(12);
        } else {
            setPayments(1);
        }
    }, [multiSub])

    const submit = () => {
        console.log("sbumit")
        const nedarim = (document.getElementById("nedarim") as HTMLIFrameElement).contentWindow;

        if (!nedarim) return;

        nedarim.postMessage(
            {
                Name: "FinishTransaction2",
                Value: {
                    Mosad,
                    ApiValid,
                    Param2: dedication,
                    Street: address,
                    FirstName: fullName,
                    City: city,
                    Mail: email,
                    Phone: phoneNumber,
                    Param1: `${anonymous},${data.amb ?? amb}`,
                    Comment: `${data.campaign}`,
                    Tashlumim: payments,
                    Amount: amount,
                    Currency: 1,
                    'PaymentType': payments == 1 ? "Ragil" : "HK",
                    'Zeout': '',
                    'LastName': '',
                    'Groupe': '',
                    'ForceUpdateMatching': '1'
                }
            }, "*"
        )

    }


    return (
        <div
            dir="rtl"
            className="p-6"
        >
            <Stack>
                <TextInput type="hidden" name="campaign" value={data.campaign} />
                {data.amb ? (
                    <>
                        <TextInput name="amb" value={data.ambs[0]?.label} readOnly />
                    </>
                ) : (
                    <Select label="שגריר" searchable data={data.ambs} onChange={(e) => setAmb(e ?? "")} name="amb" />
                )}

                <TextInput name="full_name" required label="שם מלא" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <TextInput name="email" type="email" label="דואר אלקטרוני" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextInput name="phone" type="tel" label="טלפון נייד" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <TextInput name="address" type="text" label="כתובת" value={address} onChange={(e) => setAddress(e.target.value)} />
                <TextInput name="city" type="text" label="עיר" value={city} onChange={(e) => setCity(e.target.value)} />
                <NumberInput name="amount" label="סכום" value={amount} onChange={(num) => setAmount(num ?? 1)} />
                <Checkbox
                    label="תרומה חוזרת"
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

                <Checkbox label="תרומה אנונימית" name="anonymous" checked={anonymous} onChange={() => setAnonymous(prev => !prev)} />

                <Textarea name="dedication" label="הקדשה" value={dedication} onChange={(e) => setDedication(e.target.value)} />

                <iframe src={`https://www.matara.pro/nedarimplus/iframe/`} height={320} id="nedarim" ></iframe>

                <Button onClick={() => submit()}>תרום</Button>
            </Stack>
        </div>
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
