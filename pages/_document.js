import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <html>
        <Head>
          <title>Auth 14</title>
          <link href="https://fonts.googleapis.com/css?family=Quicksand" rel="stylesheet"/>
          <style>{`
            html, body { 
              margin: 0;
              height: 100%;
              width: 100%;
              overflow: auto;
            }
            html * {
              font-family: Quicksand, sans-serif;
            }
            *:focus {
              outline: none;
            }
            #__next {
              height: 100%;
              width: 100%;
            }
            a, a:visited, a:focus {
              color: #972ac0;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}