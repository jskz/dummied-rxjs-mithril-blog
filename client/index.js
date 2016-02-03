import m from 'mithril'
import Rx from 'rx'
import fetch from 'isomorphic-fetch'

const INITIAL_ENTRIES   = 10
const INITIAL_OFFSET    = 0
const POSTS_BASE_URL    = `http://jsonplaceholder.typicode.com/posts`

let Component = {
    controller: function() {
        this.pagination = m.prop({
            offset:     INITIAL_OFFSET,
            entries:    INITIAL_ENTRIES
        })

        this.posts      = m.prop([])
        this.selected   = m.prop([])
        this.search     = m.prop('')

        const offset$ = Rx.Observable.fromEvent(document, 'input')
            .filter(el => el.target.id === 'offset')
            .map(event => event.target.value)
            .startWith(INITIAL_OFFSET)

        const entries$ = Rx.Observable.fromEvent(document, 'input')
            .filter(el => el.target.id === 'entries')
            .map(event => event.target.value)
            .startWith(INITIAL_ENTRIES)

        const input$ = Rx.Observable.fromEvent(document, 'input')
            .filter(el => el.target.id === 'search')
            .map(event => event.target.value)
            .startWith('')

        const search$ = Rx.Observable
            .combineLatest(input$)
            .subscribe(this.search)

        const pagination$ = Rx.Observable
            .combineLatest(
                offset$,
                entries$,
                (offset, entries) =>
                    this.pagination({ offset: offset, entries: entries })
                )

        const request$ = Rx.Observable
            .just(`${POSTS_BASE_URL}`)

        const response$ = Rx.Observable
            .fromPromise(
                fetch(POSTS_BASE_URL)
                    .then(res => res.json())
            )

        const selected$ = Rx.Observable
            .combineLatest(response$, pagination$, input$,
                (response, pagination, input) =>
                    {
                        let i = 0, c = 0
                        return response
                            .filter(post =>
                                -1 !== post.body.toLowerCase().indexOf(input.toLowerCase()))
                            .filter(() => (++i > pagination.offset))
                            .filter(() => (++c < pagination.entries))
                    }
                )
            .subscribe((data) => {
                this.selected(data)

                m.redraw()
            })
    },

    view: function({ ...model, selected, pagination, search }) {
        return m('div', { class: 'container' }, [
            m('div', { class: 'pagination' }, [
                m('label', 'Offset'),
                m('input', { type: 'range', id: 'offset', value: pagination().offset }),

                m('label', 'Display#'),
                m('input', { type: 'range', id: 'entries', value: pagination().entries }),

                m('label', 'Search'),
                m('input', { type: 'text', id: 'search', value: search() })
            ]),

            m('ul', { class: 'posts' }, [
                selected()
                    .map(post =>
                        m('li', { class: 'post' }, [
                            m('h2', post.title),
                            m('p', post.body)
                        ])
                )
            ])
        ])
    }
}

window.addEventListener('load', function load() {
    let origin = document.getElementById('origin')

    if(null === origin || 'undefined' === typeof origin) {
        origin = document.createElement('div')
        document.body.appendChild(origin)
    }

    m.mount(origin, Component)
    window.removeEventListener('load', load, false)
})
