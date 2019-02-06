#!/bin/bash

kubectl delete -f nfs-server-service.yaml -n cellery-system

kubectl delete -f nfs-deployment.yaml -n cellery-system

kubectl delete -f nfs-persistent-volume-claim.yaml -n cellery-system

kubectl delete -f nfs-persistent-volumes-local.yaml -n cellery-system
