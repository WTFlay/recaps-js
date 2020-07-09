#!/usr/bin/env node

const { parse } = require('node-html-parser')
const fetch = require('node-fetch')

const BASE_URL = 'https://openclassrooms.com'
const ROOT = '/forum/categorie/javascript'

/**
 * Get a HTML content page and return posts node (title and link)
 */
function parsePosts(html) {
    const root = parse(html)
    const nodes = root.querySelectorAll('.cellsLink.span5')
    return nodes.map(node => {
        const href = node
            .querySelector('a')
            .rawAttrs.split('=')[1]
            .replace(/"/g, '')
        const title = node.querySelector('h3').text
        return { title, href }
    })
}

/**
 * return a array of paragraphe from a post
 */
function parsePost(html) {
    const root = parse(html)
    const comments = root.querySelectorAll('.message.markdown-body')
    return comments
        .map(comment => {
            return comment.querySelectorAll('p').map(node => node.text)
        })
        .flat()
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

fetch(`${BASE_URL}${ROOT}`)
    .then(res => res.text())
    .then(parsePosts)
    .then(posts => {
        return Promise.all(
            posts.map(post => {
                return fetch(`${BASE_URL}${post.href}`)
                    .then(res => res.text())
                    .then(parsePost)
                    .then(parags => parags.filter(p => p.length > 120))
            })
        )
    })
    .then(groupsParags => groupsParags.flat())
    .then(parags => {
        const max = parags.length

        const objectif = parags[getRandomInt(max)]
        const actions = parags[getRandomInt(max)]
        const result = parags[getRandomInt(max)]

        return { objectif, actions, result }
    })
    .then(recaps => {
        return `Objectifs: ${recaps.objectif}\nActions: ${recaps.actions}\nResultats: ${recaps.result}`
    })
    .then(console.log)
