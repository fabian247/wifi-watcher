import { expect } from 'chai'
import IPv4address from 'pcap/decode/ipv4_addr'
import { getRouteFromPacket, getLocalAddress } from '../lib/expose_websites'

describe('expose websites', () => {
    it('should get route from IPv4 packet', () => {
        const saddr = new IPv4address()
        saddr.addr = [192, 168, 178, 33]
        const daddr = new IPv4address()
        daddr.addr = [85, 124, 84, 253]

        const ipv4Packet = {
            payload:
                {
                    ethertype: 2048,
                    payload: {
                        saddr,
                        daddr,
                    }
                }
        }
        const route = getRouteFromPacket(ipv4Packet)
        expect(route).to.deep.equal({senderIP: '192.168.178.33', receiverIP: '85.124.84.253'})
    })
    it('should return default text for IPv6 packet', () => {
        const ipv6Packet = {
            payload:
                {
                    ethertype: 34525,
                    payload: {}
                }
        }
        const response = getRouteFromPacket(ipv6Packet)
        expect(response).to.equal('IPv6 Packet')
    })
    it('should throw error if packet not known', () => {
      const unknownPacket = {
          payload: { ethertype: 0 }
      }
      expect(() => getRouteFromPacket(unknownPacket)).to.throw(Error, /Don\'t know how to handle this packet/)
    })
})

describe('Get local IP address', () => {
    it('should return local IP adress even if close match', () => {
        // local IP is hardcoded as 192.168.178.0 for now
        const local = '192.168.179.2'
        const receiver = '192.168.178.1'
        const result = getLocalAddress(local, receiver)
        expect(result).to.deep.equal({local: receiver, receiver: local})
    })
})
