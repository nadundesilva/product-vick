#!/bin/bash

kubectl delete configmap mysql-dbscripts -n cellery-system

kubectl delete -f mysql-service.yaml -n cellery-system

kubectl delete -f mysql-deployment.yaml -n cellery-system

kubectl delete -f mysql-persistent-volume-claim.yaml -n cellery-system

kubectl delete -f mysql-persistent-volumes-local.yaml -n cellery-system
