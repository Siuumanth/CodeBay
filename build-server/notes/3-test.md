1. Create a simple react project and push it to github.
2.  Go to AWS cluster > your cluster > tasks > run new task > configure it to match builder , Launch type, add ENV variables

![[Pasted image 20250528015605.png]]

But to go further and running this task , you will need a VPC with a subnet, so create that first, let it be default settings and come back and assign that VPC here.

After that , create the task to run, and it should enter provisioning mode.

One error message I encountered while running task:
`exec /home/app/main.sh: exec format error`