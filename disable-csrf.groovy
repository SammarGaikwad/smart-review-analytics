import jenkins.model.Jenkins
Jenkins.instance.setCrumbIssuer(null)
Jenkins.instance.save()
