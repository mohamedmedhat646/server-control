pipeline {
    agent any

    environment {
        K8S_NAMESPACE = "server-control"

        BACKEND_IMAGE = "mohamedmedhat646/server-control-backend"
        FRONTEND_IMAGE = "mohamedmedhat646/server-control-frontend"

        BACKEND_DEPLOYMENT = "server-control-backend"
        FRONTEND_DEPLOYMENT = "server-control-frontend"

        BACKEND_CONTAINER = "backend"
        FRONTEND_CONTAINER = "frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/mohamedmedhat646/server-control.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                cd server_control/server
                docker build -t $BACKEND_IMAGE:$BUILD_NUMBER .
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                cd server_control/client
                docker build -t $FRONTEND_IMAGE:$BUILD_NUMBER .
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push $BACKEND_IMAGE:$BUILD_NUMBER
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push $FRONTEND_IMAGE:$BUILD_NUMBER
                '''
            }
        }

        stage('Deploy Backend to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl config current-context
                    kubectl -n $K8S_NAMESPACE set image deployment/$BACKEND_DEPLOYMENT \
                      $BACKEND_CONTAINER=$BACKEND_IMAGE:$BUILD_NUMBER
                    kubectl -n $K8S_NAMESPACE rollout status deployment/$BACKEND_DEPLOYMENT
                    '''
                }
            }
        }

        stage('Deploy Frontend to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl -n $K8S_NAMESPACE set image deployment/$FRONTEND_DEPLOYMENT \
                      $FRONTEND_CONTAINER=$FRONTEND_IMAGE:$BUILD_NUMBER
                    kubectl -n $K8S_NAMESPACE rollout status deployment/$FRONTEND_DEPLOYMENT
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
