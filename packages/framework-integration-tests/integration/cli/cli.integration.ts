import util = require('util')

const exec = util.promisify(require('child_process').exec)
import { expect } from 'chai'
import { readFileContent, removeFile } from '../helper/fileHelper'
import path = require('path')

describe('cli', () => {
  const cliPath = path.join('..', 'cli', 'bin', 'run')
  describe('new entity', () => {
    before(async () => {
      try {
        await Promise.all([removeFile('src/entities/Post.ts'), removeFile('src/entities/PostWithFields.ts')])
      } catch (e) {
        // error whilst deleting file
      }
    })

    after(async () => {
      try {
        await Promise.all([
          exec('npm run compile --scripts-prepend-node-path'),
          removeFile('src/entities/Post.ts'),
          removeFile('src/entities/PostWithFields.ts'),
        ])
      } catch (e) {
        // error whilst deleting file
      }
    })

    context('valid entity', () => {
      describe('without fields', () => {
        it('should create new entity', async () => {
          const expectedOutputRegex = new RegExp(
            /(.+) boost (.+)?new:entity(.+)? (.+)\n- Verifying project\n(.+) Verifying project\n- Creating new entity\n(.+) Creating new entity\n(.+) Entity generated!\n/
          )
          const { stdout } = await exec(`${cliPath} new:entity Post`)
          expect(stdout).to.match(expectedOutputRegex)

          const expectedEntityContent = await readFileContent('test/fixtures/entities/Post.ts')
          const entityContent = await readFileContent('src/entities/Post.ts')
          expect(entityContent).to.equal(expectedEntityContent)
        })
      })

      describe('with fields', () => {
        it('should create new entity with expected fields', async () => {
          const expectedOutputRegex = new RegExp(
            /(.+) boost (.+)?new:entity(.+)? (.+)\n- Verifying project\n(.+) Verifying project\n- Creating new entity\n(.+) Creating new entity\n(.+) Entity generated!\n/
          )
          const { stdout } = await exec(`${cliPath} new:entity PostWithFields --fields title:string body:string`)
          expect(stdout).to.match(expectedOutputRegex)

          const expectedEntityContent = await readFileContent('test/fixtures/entities/Post_with_fields.ts')
          const entityContent = await readFileContent('src/entities/PostWithFields.ts')
          expect(entityContent).to.equal(expectedEntityContent)
        })
      })
    })

    context('invalid entity', () => {
      describe('missing entity name', () => {
        it('should fail', async () => {
          const { stderr } = await exec(`${cliPath} new:entity`)

          expect(stderr).to.equal(
            "You haven't provided an entity name, but it is required, run with --help for usage\n"
          )
        })
      })
    })

    describe('with reducer', () => {
      it('should create new entity with reducer', async () => {
        await exec(`${cliPath} new:event PostCreated --fields postId:UUID title:string body:string`)
        const { stdout } = await exec(`${cliPath} new:entity PostWithReducer --reduces PostCreated`)
        console.log(stdout)
      })
    })
  })
})
