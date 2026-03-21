pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "mohamedmedhat646/server-control-backend"
        K8S_NAMESPACE = "server-control"
        DEPLOYMENT_NAME = "server-control-backend"
        CONTAINER_NAME = "backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/mohamedmedhat646/server-control.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                cd server_control/server
                docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .
                '''
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    docker push $DOCKER_IMAGE:$BUILD_NUMBER
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl config current-context
                    kubectl get ns
                    kubectl -n $K8S_NAMESPACE set image deployment/$DEPLOYMENT_NAME \
                      $CONTAINER_NAME=$DOCKER_IMAGE:$BUILD_NUMBER
                    kubectl -n $K8S_NAMESPACE rollout status deployment/$DEPLOYMENT_NAME
                    '''
                }
            }
        }
    }
}
