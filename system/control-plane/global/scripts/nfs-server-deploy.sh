#!/bin/bash

kubectl create -f nfs-persistent-volumes-local.yaml -n cellery-system

kubectl apply -f nfs-persistent-volume-claim.yaml -n cellery-system

kubectl apply -f nfs-deployment.yaml -n cellery-system

kubectl apply -f nfs-server-service.yaml -n cellery-system
