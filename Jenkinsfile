// Use Pipeline from SCM or Multibranch Pipeline with Node.js 22 and npm on PATH.
// Supports Unix and Windows agents.
def runCommand(String command) {
    if (isUnix()) {
        sh command
    } else {
        bat command
    }
}

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        // Build-only placeholders; this pipeline does not deploy.
        DATABASE_URL = 'postgresql://ci:ci@127.0.0.1:5432/susmita_ci'
        JWT_SECRET = 'jenkins-build-only-do-not-use-in-production'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }
        stage('Install dependencies') {
            steps {
                runCommand('node --version')
                runCommand('npm --version')
                runCommand('npm ci --include=dev --no-audit --no-fund')
            }
        }
        stage('Generate Prisma client') {
            steps {
                runCommand('npx --no-install prisma generate')
            }
        }
        stage('Lint') {
            steps {
                runCommand('npm run lint')
            }
        }
        stage('Type check') {
            steps {
                // next.config.ts skips type errors, so check them explicitly.
                runCommand('npx --no-install next typegen')
                runCommand('npx --no-install tsc --noEmit')
            }
        }
        stage('Build') {
            steps {
                // npm run build runs db:sync. CI must not modify a database.
                runCommand('npx --no-install next build')
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
