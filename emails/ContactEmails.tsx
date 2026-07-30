import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

type ContactEmailProps = {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  requestId: string;
  submittedAt: string;
  spamScore: number;
};

const colors = { ink: "#080906", paper: "#f0eadb", lime: "#d6ff35", muted: "#777b70" };

export function OwnerContactEmail(props: ContactEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New portfolio inquiry from {props.name}</Preview>
      <Body style={{ backgroundColor: colors.ink, color: colors.paper, fontFamily: "Arial, sans-serif", padding: "32px 12px" }}>
        <Container style={{ maxWidth: "620px", border: "1px solid #34372e", padding: "28px" }}>
          <Text style={{ color: colors.lime, fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>CONTACT / REQUEST ACCEPTED</Text>
          <Heading style={{ fontSize: "30px", lineHeight: "1.15", margin: "20px 0" }}>{props.subject}</Heading>
          <Section style={{ backgroundColor: "#11130e", padding: "16px", borderLeft: `3px solid ${colors.lime}` }}>
            <Text><strong>From:</strong> {props.name} &lt;{props.email}&gt;</Text>
            <Text><strong>Company:</strong> {props.company || "Not provided"}</Text>
            <Text style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{props.message}</Text>
          </Section>
          <Hr style={{ borderColor: "#34372e", margin: "24px 0" }} />
          <Text style={{ color: colors.muted, fontFamily: "monospace", fontSize: "11px", lineHeight: "1.7" }}>
            request_id: {props.requestId}<br />
            submitted_at: {props.submittedAt}<br />
            spam_score: {props.spamScore}<br />
            source: privacy-preserving hash retained; raw address discarded
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function VisitorConfirmationEmail(props: ContactEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your message reached Ali Mohammadi</Preview>
      <Body style={{ backgroundColor: colors.ink, color: colors.paper, fontFamily: "Arial, sans-serif", padding: "32px 12px" }}>
        <Container style={{ maxWidth: "620px", border: "1px solid #34372e", padding: "28px" }}>
          <Text style={{ color: colors.lime, fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>201 / MESSAGE ACCEPTED</Text>
          <Heading style={{ fontSize: "30px", lineHeight: "1.15", margin: "20px 0" }}>Thanks, {props.name}.</Heading>
          <Text style={{ lineHeight: "1.7" }}>Your message was received successfully. This confirmation does not promise a specific response time, but the inquiry is now available for review.</Text>
          <Section style={{ backgroundColor: "#11130e", padding: "16px", borderLeft: `3px solid ${colors.lime}` }}>
            <Text><strong>{props.subject}</strong></Text>
            <Text style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{props.message}</Text>
          </Section>
          <Text style={{ color: colors.muted, fontFamily: "monospace", fontSize: "11px" }}>request_id: {props.requestId}</Text>
        </Container>
      </Body>
    </Html>
  );
}
