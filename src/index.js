const { Command, flags } = require("@oclif/command")
const git = require("simple-git/promise")
const chunk = require("lodash.chunk")
const chalk = require("chalk")

class GitChunkCommand extends Command {
  async run() {
    // const {flags} = this.parse(GitChunkCommand)
    // const name = flags.name || 'world'

    const files = (await git().status()).files.map(file => file.path)

    const filesChunks = chunk(files, 100)
    console.log(
      chalk.blueBright.inverse(
        `\n git-chunk: chunking ${files.length} files in ${filesChunks.length} chunks \n`
      )
    )
    let chunkNo = 0

    for (const filesChunk of filesChunks) {
      const chunkGit = git().outputHandler((command, stdout, stderr) => {
        stdout.pipe(process.stdout)
        stderr.pipe(process.stderr)
      })

      chunkNo++

      const chunkMessage = `chunk ${chunkNo} of ${filesChunks.length}`

      console.log(chalk.inverse(`\n committing ${chunkMessage} \n`))

      await chunkGit.add(filesChunk)

      await chunkGit.commit(`commit ${chunkMessage}`)

      console.log(chalk.inverse(`\n pushing ${chunkMessage} \n`))
      await chunkGit.push("origin", "master")

      console.log(
        chalk.greenBright.inverse(`\n committed and pushed ${chunkMessage} \n`)
      )
    }
  }
}

GitChunkCommand.description = `Describe the command here
...
Extra documentation goes here
`

GitChunkCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: "v" }),
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  name: flags.string({ char: "n", description: "name to print" }),
}

module.exports = GitChunkCommand
