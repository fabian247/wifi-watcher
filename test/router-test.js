import { expect } from 'chai'
import supertest from 'supertest'
import { makeServer, killServer, removeIPv6Preface } from '../lib/router'

describe('Router test', () => {
    it('should return monitpring page on route "/"', (done) => {
        // this.timeout = 1000
        const server = makeServer(1234)
        supertest(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
                console.log(err)
                expect(err).to.equal(null)
                expect(res.text).to.match(/You visited following IP addresses/)
                killServer(server)
                done()
            })
    })
    it('should return monitpring page on another route', (done) => {
        // this.timeout = 1000
        const server = makeServer(1234)
        supertest(server)
            .get('/anotherRoute')
            .expect(200)
            .end((err, res) => {
                console.log(err)
                expect(err).to.equal(null)
                expect(res.text).to.match(/You visited following IP addresses/)
                killServer(server)
                done()
            })
    })
})

describe('clean IP address', () => {
    it('should remove IPv6 preface', () => {
        expect(removeIPv6Preface('::ffff:0.0.0.0')).to.be.equal('0.0.0.0')
    })
})
