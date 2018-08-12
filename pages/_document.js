import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage }) {
    const sheet = new ServerStyleSheet()
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
    const styleTags = sheet.getStyleElement()
    return { ...page, styleTags }
  }

  render() {
    return (
      <html>
        <Head>
          <title>DN5</title>
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
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}