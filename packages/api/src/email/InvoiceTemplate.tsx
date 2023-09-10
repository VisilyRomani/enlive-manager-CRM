import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import format from "date-fns/format";
import addDays from "date-fns/addDays";
import * as React from "react";
import { IInput, ITax } from "../router/invoice";
import Dinero from "dinero.js";

export const InvoiceTemplate = ({
  input,
  total,
  calculateTotals,
}: {
  input: IInput;
  total: Dinero.Dinero;
  calculateTotals: { tax: ITax[]; subtotal: Dinero.Dinero };
}) => (
  <Html>
    <Head />
    <Preview>
      Thanks for being a customer. A detailed summary of your invoice is
      attached.
    </Preview>
    <Tailwind
      config={{
        theme: {
          fontFamily: {
            sans: ["Graphik", "sans-serif"],
            serif: ["Merriweather", "serif"],
          },
        },
      }}
    >
      <Body className="bg-white font-sans">
        <Container className="mx-auto pt-[20px] pb-[48px] px-5">
          <Section>
            <Row>
              <Column>
                <Heading className="text-gray-800 text-3xl p-0 my-[30px] mx-0 font-normal">
                  <strong>{input.invoice_template.company_name}</strong>
                </Heading>
              </Column>
              <Column align="right" className="table-cell">
                <strong className="text-gray-400">
                  <Text className="text-2xl">Invoice</Text>
                </strong>
              </Column>
            </Row>
          </Section>
          <Section className="border-collapse border-spacing-0">
            <Row>
              <Column>
                <Text className=" text-gray-400">Prepared For</Text>
                <strong>
                  <Text className="leading-3 text-xl text-gray-700">
                    {input.client.name}
                    <Text className="leading-[1px] text-gray-700">
                      {input.client.address.address},{" "}
                      {input.client.address.city}
                    </Text>
                  </Text>
                </strong>
              </Column>
              <Column align="right" className="align-top">
                <Row>
                  <Text className="text-gray-400">Period</Text>
                  <Text className="leading-3 text-xl  text-gray-700">
                    <strong>{format(new Date(), "MMM d")}</strong> to{" "}
                    <strong>
                      {format(
                        addDays(
                          new Date(),
                          input.invoice_template.due_date ?? 0
                        ),
                        "MMM d"
                      )}
                    </strong>
                  </Text>
                </Row>
              </Column>
            </Row>
          </Section>
          <Hr className="border-gray-300 my-5" />
          <Section>
            <Row>
              <Column className="pr-3">
                <strong>
                  <Text className="text-sky-600 text-lg">
                    We appreicate your business.
                  </Text>
                </strong>
                <Text className="max-w-[350px] mr-3">
                  Thanks for being a customer. A detailed summary of your
                  invoice is attached. If you have any questions, we're happy to
                  help. You can contact us at {input.invoice_template.email} or
                  call {input.invoice_template.phone}.
                </Text>
              </Column>
              <Column align="right">
                <Img src={input.invoice_template.logo} width={200} />
              </Column>
            </Row>
          </Section>
          <Hr className="border-gray-300 my-5" />
          <Section>
            <Row>
              <strong>
                <Text className="text-sky-600 text-lg">Invoice Summary</Text>
              </strong>
            </Row>
            <Row>
              <Column className="p-0 m-0">
                <Text className="text-gray-400 text-base m-0">Description</Text>
              </Column>
              <Column align="right" className="p-0 m-0">
                <Text className="text-gray-400 text-base m-0">Amount</Text>
              </Column>
            </Row>
            <Hr className="border-gray-300" />
            {input.client.charge.map((item, idx) => {
              return (
                <>
                  <Row key="idx">
                    <Column>
                      <strong>
                        <Text className="text-sm my-2 text-gray-600">
                          {item.quantity} {item.description}
                        </Text>
                      </strong>
                    </Column>
                    <Column align="right">
                      <Text className="text-sm my-2 text-gray-600">
                        ${Dinero({ amount: item.price }).toFormat("0.00")}
                      </Text>
                    </Column>
                  </Row>
                  <Hr className="border-gray-300" />
                </>
              );
            })}
          </Section>
          <Section align="right">
            <Row>
              <Column width="70%" align="right">
                <Text className="text-sm my-2 text-gray-600">Subtotal</Text>
              </Column>
              <Column width="30%" align="right">
                <Text className="text-sm my-2 text-gray-600">
                  ${calculateTotals.subtotal.toFormat("0.00")}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column width="70%" align="right">
                <Text className="text-sm my-2 text-gray-600">Tax</Text>
              </Column>
              <Column width="30%" align="right">
                <Text className="text-sm my-2 text-gray-600">
                  $
                  {calculateTotals.tax
                    .reduce((acc, cur) => {
                      return acc.add(cur.total.multiply(cur.percent / 100));
                    }, Dinero({ amount: 0 }))
                    .toFormat("0.00")}
                </Text>
              </Column>
            </Row>
            {!!input.client.payment && (
              <Row>
                <Column width="70%" align="right">
                  <Text className="text-sm my-2 text-gray-600">Payment</Text>
                </Column>
                <Column width="30%" align="right">
                  <Text className="text-sm my-2 text-gray-600">
                    $
                    {Dinero({ amount: input.client.payment * 100 }).toFormat(
                      "0.00"
                    )}
                  </Text>
                </Column>
              </Row>
            )}
            <Row>
              <Column width="70%" align="right">
                <Text className="text-sm my-2 text-gray-600">Total</Text>
              </Column>
              <Column width="30%" align="right">
                <Text className="text-sm my-2 text-gray-600">
                  $
                  {total
                    .subtract(Dinero({ amount: input.client.payment * 100 }))
                    .toFormat("0.00")}
                </Text>
              </Column>
            </Row>
          </Section>
          <Hr className="border-gray-300" />
          <Section>
            <Column>
              <Text className="text-center text-gray-600">
                {input.invoice_template.footer}
              </Text>
            </Column>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default InvoiceTemplate;
