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
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                cd server_control/server
                docker build -t $BACKEND_IMAGE:$BUILD_NUMBER .
                docker tag $BACKEND_IMAGE:$BUILD_NUMBER $BACKEND_IMAGE:latest
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                cd server_control/client
                docker build -t $FRONTEND_IMAGE:$BUILD_NUMBER .
                docker tag $FRONTEND_IMAGE:$BUILD_NUMBER $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push $BACKEND_IMAGE:$BUILD_NUMBER
                docker push $BACKEND_IMAGE:latest
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push $FRONTEND_IMAGE:$BUILD_NUMBER
                docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Apply Kubernetes Manifests') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"

                    kubectl -n $K8S_NAMESPACE apply -f k8s/app-configmap.yaml
                    kubectl -n $K8S_NAMESPACE apply -f k8s/app-secret.yaml
                    kubectl -n $K8S_NAMESPACE apply -f k8s/mongo-pvc.yaml
                    kubectl -n $K8S_NAMESPACE apply -f k8s/mongo.yaml
                    kubectl -n $K8S_NAMESPACE apply -f k8s/backend.yaml
                    kubectl -n $K8S_NAMESPACE apply -f k8s/frontend.yaml
                    '''
                }
            }
        }

        stage('Deploy Backend Image') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"

                    kubectl -n $K8S_NAMESPACE set image deployment/$BACKEND_DEPLOYMENT \
                      $BACKEND_CONTAINER=$BACKEND_IMAGE:$BUILD_NUMBER

                    kubectl -n $K8S_NAMESPACE rollout status deployment/$BACKEND_DEPLOYMENT --timeout=180s
                    '''
                }
            }
        }

        stage('Deploy Frontend Image') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"

                    kubectl -n $K8S_NAMESPACE set image deployment/$FRONTEND_DEPLOYMENT \
                      $FRONTEND_CONTAINER=$FRONTEND_IMAGE:$BUILD_NUMBER

                    kubectl -n $K8S_NAMESPACE rollout status deployment/$FRONTEND_DEPLOYMENT --timeout=180s
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"

                    kubectl -n $K8S_NAMESPACE get deploy
                    kubectl -n $K8S_NAMESPACE get pods -o wide
                    kubectl -n $K8S_NAMESPACE get svc
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
