import numpy as np
from scipy.stats import pearsonr

theta_file = open("thetas.txt")

theta_lines = theta_file.readlines()
thetas = np.zeros((3, len(theta_lines)//3, 20))

for t in range(thetas.shape[1]):
    thetas[0, t, :] = [float(p) for p in theta_lines[3*t][:-2].split(",")]
    thetas[1, t, :] = [float(p) for p in theta_lines[3*t+1][:-2].split(",")]
    thetas[2, t, :] = [float(p) for p in theta_lines[3*t+2][:-2].split(",")]

a_c_cor = pearsonr(thetas[0, -1, :], thetas[1, -1, :])
a_s_cor = pearsonr(thetas[0, -1, :], thetas[2, -1, :])
c_s_cor = pearsonr(thetas[1, -1, :], thetas[2, -1, :])

print(a_c_cor)
print(a_s_cor)
print(c_s_cor)
