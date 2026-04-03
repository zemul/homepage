export type Currency = "CNY" | "USD";

export interface AiSubscriptionRecord {
    id: string;
    tool: string;
    accountLabel: string;
    startMonth?: `${number}-${number}`;
    monthlyFee?: number;
    currency: Currency;
    cadence: "monthly";
    noteKey?: "complete" | "missingStart" | "missingPrice" | "missingStartAndPrice";
}

export const aiSubscriptions: AiSubscriptionRecord[] = [
    {
        id: "cloud-code-01",
        tool: "Cloud Code",
        accountLabel: "01",
        startMonth: "2024-11",
        monthlyFee: 90,
        currency: "CNY",
        cadence: "monthly",
        noteKey: "complete",
    },
    {
        id: "cloud-code-02",
        tool: "Cloud Code",
        accountLabel: "02",
        startMonth: "2025-06",
        monthlyFee: 90,
        currency: "CNY",
        cadence: "monthly",
        noteKey: "complete",
    },
    {
        id: "chatgpt-plus",
        tool: "ChatGPT Plus",
        accountLabel: "Primary",
        startMonth: "2023-12",
        monthlyFee: 100,
        currency: "CNY",
        cadence: "monthly",
        noteKey: "complete",
    },
    {
        id: "google-gemini",
        tool: "Google Gemini",
        accountLabel: "Primary",
        startMonth: "2025-08",
        monthlyFee: 20,
        currency: "USD",
        cadence: "monthly",
        noteKey: "complete",
    },
    {
        id: "doubao",
        tool: "Doubao",
        accountLabel: "Primary",
        currency: "CNY",
        cadence: "monthly",
        noteKey: "missingStartAndPrice",
    },
];
