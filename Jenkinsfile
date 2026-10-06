pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        CI_DB_URL = 'postgresql://ci_user:ci_secret_password@localhost:5433/smart_review_ci?schema=public'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                echo '==================================================='
                echo 'STAGE 1: Checking out source code from SCM'
                echo '==================================================='
                checkout scm
            }
        }

        stage('Environment Validation') {
            steps {
                echo '==================================================='
                echo 'STAGE 2: Validating Agent Environment & Tooling'
                echo '==================================================='
                sh '''
                    echo "Git Version:" && git --version || true
                    echo "Docker Version:" && docker --version || true
                    echo "Docker Compose Version:" && docker compose version || true
                    echo "Node Version:" && node --version || true
                    echo "NPM Version:" && npm --version || true
                    echo "Python Version:" && python3 --version || python --version || true
                '''
            }
        }

        stage('Backend Validation') {
            steps {
                echo '==================================================='
                echo 'STAGE 3: Validating Backend TypeScript Compilation'
                echo '==================================================='
                dir('backend') {
                    sh 'npm install'
                    sh 'npx prisma generate'
                    sh 'npx tsc --noEmit'
                }
            }
        }

        stage('Analytics Validation') {
            steps {
                echo '==================================================='
                echo 'STAGE 4: Validating Python FastAPI Application'
                echo '==================================================='
                dir('analytics') {
                    sh 'python -m compileall app || python3 -m compileall app'
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo '==================================================='
                echo 'STAGE 5: Building Docker Images for Services'
                echo '==================================================='
                sh 'docker compose build'
                sh 'docker compose -f docker-compose.ci.yml build'
            }
        }

        stage('Docker Compose Validation') {
            steps {
                echo '==================================================='
                echo 'STAGE 6: Validating Compose Configuration Specs'
                echo '==================================================='
                sh 'docker compose config > /dev/null'
                sh 'docker compose -f docker-compose.ci.yml config > /dev/null'
                echo '✓ Compose configurations are valid.'
            }
        }

        stage('CI Container Startup') {
            steps {
                echo '==================================================='
                echo 'STAGE 7: Starting Isolated CI Container Topology'
                echo '==================================================='
                sh 'docker compose -f docker-compose.ci.yml up -d'
                echo 'Waiting for CI services to initialize healthchecks...'
                sleep time: 15, unit: 'SECONDS'
                sh 'docker compose -f docker-compose.ci.yml ps'
            }
        }

        stage('CI Database Schema & Seed') {
            steps {
                echo '==================================================='
                echo 'STAGE 8: Deploying Schema to Isolated CI Postgres'
                echo '==================================================='
                // NOTE: Executed strictly against disposable smart_review_ci container
                sh 'docker compose -f docker-compose.ci.yml exec -T backend_ci npx prisma db push --skip-generate'
                sh 'docker compose -f docker-compose.ci.yml exec -T backend_ci npm run prisma:seed'
            }
        }

        stage('Health Checks') {
            steps {
                echo '==================================================='
                echo 'STAGE 9: Verifying Container Health Endpoints'
                echo '==================================================='
                sh 'curl -f http://127.0.0.1:5001/api/health || exit 1'
                sh 'curl -f http://127.0.0.1:8001/api/analytics/health || exit 1'
                echo '✓ All container health checks PASSED.'
            }
        }

        stage('Integration Smoke Tests') {
            steps {
                echo '==================================================='
                echo 'STAGE 10: Executing End-to-End API Smoke Tests'
                echo '==================================================='
                sh '''
                    # 1. Domains & Products Check
                    curl -f http://127.0.0.1:5001/api/domains || exit 1
                    curl -f http://127.0.0.1:5001/api/products || exit 1

                    # 2. Network Analytics Check
                    curl -f http://127.0.0.1:5001/api/analytics/network || exit 1

                    # 3. Auth Login Check
                    curl -f -X POST http://127.0.0.1:5001/api/auth/login \
                         -H "Content-Type: application/json" \
                         -d '{"email":"admin@analytics.com","password":"password123"}' || exit 1

                    echo "✓ End-to-End CI Smoke Tests PASSED."
                '''
            }
        }
    }

    post {
        always {
            echo '==================================================='
            echo 'STAGE 11: Cleaning Up Disposable CI Containers'
            echo '==================================================='
            // Cleanup disposable CI container resources only (real DB untouched)
            sh 'docker compose -f docker-compose.ci.yml down -v --remove-orphans || true'
        }
        success {
            echo '==================================================='
            echo '🎉 JENKINS PIPELINE COMPLETED SUCCESSFULLY!'
            echo '==================================================='
        }
        failure {
            echo '==================================================='
            echo '❌ JENKINS PIPELINE FAILED. INSPECT LOGS ABOVE.'
            echo '==================================================='
        }
    }
}
