import assert from "assert/strict"
import "../src/plumb.js"

describe("Array", ()=> {
    describe("#indexof()", ()=> {
        it("Should return -1 when the value is not present", ()=> {
            assert.deepEqual([1,2,3].indexOf(4), -1)
        })
    })
})