import {
    Body,
    Button,
    Container,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Tailwind,
  } from "@react-email/components";
  import { Logo } from "../components/logo";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  
  interface WelcomeEmailProps {
    name?: string;
  }
  
  export default function WelcomeEmail({ name = 'there' }: WelcomeEmailProps) {
    return (
      <Html>
        <Preview>Welcome to Graham</Preview>
        <Tailwind>
          <Body className="my-auto mx-auto font-sans">
            <Container className="border-transparent my-[40px] mx-auto max-w-[600px]">
              <Logo />
              <Heading className="font-normal text-center p-0 my-[30px] mx-0">
                Welcome to Graham
              </Heading>
              <Section className="mb-4">
                Hi {name}, welcome aboard!
              </Section>
              <Section className="mb-4">
                We're excited to help you set up your AI phone agent. With Graham, you'll be able to handle calls more efficiently and provide better service to your customers.
              </Section>
              <Section className="mb-8">
                To get started, click the button below to access your dashboard and begin configuring your AI agent.
              </Section>
              <Section className="mb-6">
                <Button
                  href={`${baseUrl}/dashboard`}
                  className="bg-black text-white p-4 text-center"
                >
                  Set up your agent
                </Button>
              </Section>
              <Hr />
              <Section className="text-sm text-gray-500 mt-4">
                If you have any questions, just reply to this email - we're always happy to help.
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  }