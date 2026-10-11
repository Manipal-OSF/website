import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'react-email';

type ExampleEmailProps = {
  name?: string;
};

export default function ExampleEmail({ name = 'there' }: ExampleEmailProps) {
  return (
    <Html lang='en'>
      <Head />
      <Preview>A hello from Manipal OSF</Preview>
      <Body
        style={{
          backgroundColor: '#eceff4',
          color: '#2e3440',
          fontFamily: 'Arial, sans-serif',
          padding: '32px 16px',
        }}
      >
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>
          <Heading>Hello, {name}!</Heading>
          <Text>
            This is an example Manipal OSF email template. Customize it when
            email features are ready.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ExampleEmail.PreviewProps = {
  name: 'OSF member',
} satisfies ExampleEmailProps;
