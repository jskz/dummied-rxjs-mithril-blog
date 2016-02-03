import { createServer as createHTTPServer } from 'http'
import koa from 'koa'
import koaLogger from 'koa-logger'
import koaStatic from 'koa-static'

const STATIC_PATH = __dirname + '/static'
const DEFAULT_PORT = 8080
const TEMPLATE_HTML = `
<!DOCTYPE html>

<html>
    <head>
        <title>Rx Blog Test</title>
        <script src="/bundle.js" type="text/javascript"></script>
    </head>
</html>
`

let app = koa()
let server = createHTTPServer(app.callback())

app.use(koaLogger())
app.use(koaStatic(STATIC_PATH))

app.use(function *(next) {
    this.status = 200
    this.body   = TEMPLATE_HTML
})

server.listen(DEFAULT_PORT, () => {
    console.log(`Listening on port ${DEFAULT_PORT}`)
})
