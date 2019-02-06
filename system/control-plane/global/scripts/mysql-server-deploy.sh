#!/bin/bash

kubectl create configmap mysql-dbscripts --from-file=mysql/dbscripts/ -n cellery-system

kubectl apply -f mysql-persistent-volumes-local.yaml -n cellery-system

kubectl apply -f mysql-persistent-volume-claim.yaml -n cellery-system

kubectl apply -f mysql-deployment.yaml -n cellery-system

kubectl apply -f mysql-service.yaml -n cellery-system
