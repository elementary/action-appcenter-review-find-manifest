const core = require('@actions/core')
const { stat } = require('fs')
const { relative, resolve } = require('path')

function fileExists(path) {
  return new Promise((resolve, reject) => {
    stat(path, (err, stats) => {
      if (err) {
        return resolve(false)
      } else {
        return resolve(stats.isFile())
      }
    })
  })
}

async function findManifest(workspace, rdnn) {
  const possibleFiles = [
    `${rdnn}.json`,
    `${rdnn}.yml`,
    `${rdnn}.yaml`
  ]

  for (const p of possibleFiles) {
    const fullPath = resolve(workspace, p)

    if (await fileExists(fullPath)) {
      return relative(workspace, fullPath)
    }
  }

  return null
}

async function run () {
  const rdnn = core.getInput('rdnn', { required: true })
  const workspace = core.getInput('workspace', { required: true })

  const manifest = await findManifest(workspace, rdnn)

  if (manifest == null) {
    core.setFailed('Unable to find manifest file')
  } else {
    core.info(`Found manifest: ${manifest}`)

    core.setOutput('manifest', manifest)
  }
}

;(async () => {
  try {
    await run()
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
})()
