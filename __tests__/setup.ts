import supertest,{Request,Response} from 'supertest'
import {it,describe,expect} from '@jest/globals'
 import {app} from '../src/server'

 const request =supertest(app)
describe ('Get /',()=>{
    it('should return Hello world',async()=>{
        const res=await request.get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello World')
    })

})