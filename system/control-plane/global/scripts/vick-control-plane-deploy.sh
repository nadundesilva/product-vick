#!/bin/bash

#DOCKER_REG_USER_EMAIL=vick-docker@gmail.com
#DOCKER_REG_USER=vick-docker@gmail.com
#DOCKER_REG_PASSWD=<vickdockerpassword>

#Setup VICK namespace, create service account and the docker registry credentials
#kubectl apply -f vick-ns-init.yaml

#Create the pub-store config maps
#kubectl create configmap apim-conf --from-file=apim-configs/pub-store -n cellery-system
#kubectl create configmap apim-conf-datasources --from-file=apim-configs/pub-store/datasources/ -n cellery-system

#Create the gw config maps
kubectl create configmap gw-conf --from-file=apim-configs/gw -n cellery-system
kubectl create configmap gw-conf-datasources --from-file=apim-configs/gw/datasources/ -n cellery-system

#Create KM config maps
kubectl create configmap conf-identity --from-file=apim-configs/gw/identity -n cellery-system
kubectl create configmap apim-template --from-file=apim-configs/gw/resources/api_templates -n cellery-system
kubectl create configmap apim-tomcat --from-file=apim-configs/gw/tomcat -n cellery-system
kubectl create configmap apim-security --from-file=apim-configs/gw/security -n cellery-system

#kubectl create configmap auth-ext --from-file=components/org.wso2.vick.auth.extensions/target/org.wso2.vick.auth.extensions-1.0.0-SNAPSHOT.jar -n cellery-system

#Create credentials for docker.wso2.com
#kubectl create secret docker-registry wso2creds --docker-server=docker.wso2.com --docker-username=$DOCKER_REG_USER --docker-password=$DOCKER_REG_PASSWD --docker-email=$DOCKER_REG_USER_EMAIL -n cellery-system

#Create apim volumes and volume claims
#kubectl apply -f vick-apim-persistent-volumes.yaml -n cellery-system
#kubectl apply -f vick-apim-persistent-volume-claim.yaml -n cellery-system

#Create apim local volumes and volume claims
kubectl apply -f vick-apim-persistent-volumes-local.yaml -n cellery-system
kubectl apply -f vick-apim-persistent-volume-claim-local.yaml -n cellery-system

#Create pub-store deployment and the service
#kubectl apply -f vick-apim-pub-store.yaml -n cellery-system

#Create pub-store ingress
#kubectl apply -f vick-apim-pub-store-ingress.yaml -n cellery-system

#Create gateway deployment and the service
kubectl apply -f vick-apim-gw.yaml -n cellery-system
#Wait till the gateway deployment availability
kubectl wait deployment/gateway --for condition=available --timeout=6000s -n cellery-system

#Create gateway ingress
kubectl apply -f vick-apim-gw-ingress.yaml -n cellery-system

#Create SP volumes and volume claims
#kubectl apply -f vick-sp-persistent-volumes.yaml -n cellery-system

#Create SP worker configmaps
kubectl create configmap sp-worker-siddhi --from-file=sp-worker/siddhi -n cellery-system
kubectl create configmap sp-worker-conf --from-file=sp-worker/conf -n cellery-system

#Create SP worker deployment
kubectl apply -f vick-sp-worker-deployment.yaml -n cellery-system
kubectl apply -f vick-sp-worker-service.yaml -n cellery-system

#Create SP status dashboard deployment
kubectl apply -f vick-observability-portal.yaml

