pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "mohamedmedhat646/server-control"
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
                    docker push mohamedmedhat646/server-control:3
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                export KUBECONFIG=/etc/kubernetes/admin.conf
                kubectl set image deployment/server-control \
                server-control=$DOCKER_IMAGE:$BUILD_NUMBER || \
                kubectl apply -f server_control/server/deployment.yaml
                '''
            }
        }
    }
}
