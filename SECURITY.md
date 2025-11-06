# Security Guide

This document outlines security best practices for deploying and maintaining the Online Ticket Booking Application.

## Pre-Production Security Checklist

### 1. Secrets Management

#### Change Default Passwords
Before deploying to production, **you must** change all default passwords and secrets:

**MySQL Secrets** (`k8s/mysql/secret.yaml`):
```yaml
# Generate strong random passwords
MYSQL_ROOT_PASSWORD: "<GENERATE_STRONG_PASSWORD>"
MYSQL_PASSWORD: "<GENERATE_STRONG_PASSWORD>"
```

**Backend Secrets** (`k8s/backend/secret.yaml`):
```yaml
# Must match MySQL password
DB_PASSWORD: "<SAME_AS_MYSQL_ROOT_PASSWORD>"

# Generate cryptographically secure JWT secret (min 32 characters)
JWT_SECRET: "<GENERATE_SECURE_RANDOM_STRING>"
```

#### Generate Secure Secrets

**Option 1: Using OpenSSL**
```bash
# Generate strong password (32 chars)
openssl rand -base64 32

# Generate JWT secret (64 chars)
openssl rand -base64 64
```

**Option 2: Using Python**
```python
import secrets
import string

# Strong password
alphabet = string.ascii_letters + string.digits + string.punctuation
password = ''.join(secrets.choice(alphabet) for _ in range(32))

# JWT secret
jwt_secret = secrets.token_urlsafe(64)
```

**Option 3: Using Node.js**
```javascript
const crypto = require('crypto');

// Strong password
const password = crypto.randomBytes(32).toString('base64');

// JWT secret
const jwtSecret = crypto.randomBytes(64).toString('base64');
```

### 2. External Secret Management (Recommended)

For production environments, use external secret management:

#### Using Kubernetes External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: backend-secret
  namespace: ticket-booking
spec:
  secretStoreRef:
    name: aws-secrets-manager  # or azure-keyvault, gcp-secrets-manager
    kind: SecretStore
  target:
    name: backend-secret
  data:
  - secretKey: DB_PASSWORD
    remoteRef:
      key: ticket-booking/db-password
  - secretKey: JWT_SECRET
    remoteRef:
      key: ticket-booking/jwt-secret
```

#### Using HashiCorp Vault

```bash
# Store secrets in Vault
vault kv put secret/ticket-booking \
  db_password=<strong-password> \
  jwt_secret=<secure-jwt-secret>

# Use Vault Agent or CSI driver to inject secrets
```

### 3. Environment Variables

#### Backend (.env)
```bash
# Never commit this file to version control
PORT=5000
DB_HOST=mysql  # or your database host
DB_USER=root
DB_PASSWORD=<STRONG_PASSWORD>
DB_NAME=ticket_booking
JWT_SECRET=<SECURE_JWT_SECRET>
NODE_ENV=production
```

#### Frontend (.env)
```bash
# Use HTTPS in production
VITE_API_URL=https://api.yourdomain.com/api
```

### 4. Database Security

#### Secure MySQL Configuration

1. **Create dedicated database user** (don't use root in production):
```sql
CREATE USER 'ticketapp'@'%' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON ticket_booking.* TO 'ticketapp'@'%';
FLUSH PRIVILEGES;
```

2. **Update backend configuration**:
```yaml
# k8s/backend/configmap.yaml
DB_USER: "ticketapp"  # instead of root
```

3. **Enable SSL/TLS for database connections** (production):
```javascript
// backend/config/database.js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
  },
});
```

### 5. Network Security

#### Configure Ingress with TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ticket-booking-ingress
  namespace: ticket-booking
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - ticket-booking.yourdomain.com
    secretName: ticket-booking-tls
  rules:
  - host: ticket-booking.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

#### Network Policies

Create Kubernetes NetworkPolicies to restrict traffic:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: ticket-booking
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mysql
    ports:
    - protocol: TCP
      port: 3306
```

### 6. Application Security

#### Rate Limiting

Add rate limiting to prevent abuse:

```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### CORS Configuration

Configure CORS properly for production:

```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

#### Input Validation

Add input validation middleware:

```javascript
// backend/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 50 }).trim().escape(),
  body('password').isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

### 7. Monitoring and Logging

#### Enable Audit Logging

```javascript
// backend/middleware/audit.js
const auditLogger = (req, res, next) => {
  const user = req.user?.id || 'anonymous';
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    user,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }));
  next();
};
```

#### Security Headers

Add security headers:

```javascript
// backend/server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

### 8. Kubernetes Security

#### Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ticket-booking
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

#### Security Context

```yaml
# In deployment.yaml
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: backend
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
```

### 9. Regular Updates

#### Dependency Updates
```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

#### Container Image Updates
- Regularly update base images
- Scan images for vulnerabilities
- Use specific versions instead of `latest`

### 10. Backup and Recovery

#### Database Backups

```bash
# Create backup script
kubectl exec deployment/mysql -n ticket-booking -- \
  mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ticket_booking > backup.sql

# Schedule with CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: ticket-booking
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mysql:8.0
            command:
            - /bin/sh
            - -c
            - mysqldump -h mysql -u root -p${MYSQL_ROOT_PASSWORD} ticket_booking > /backup/backup-$(date +%Y%m%d).sql
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: backup-pvc
```

## Security Incident Response

### If Credentials Are Compromised

1. **Immediately rotate all secrets**:
   ```bash
   # Update secrets in Kubernetes
   kubectl delete secret mysql-secret -n ticket-booking
   kubectl delete secret backend-secret -n ticket-booking
   
   # Create new secrets with new passwords
   kubectl apply -f k8s/mysql/secret.yaml
   kubectl apply -f k8s/backend/secret.yaml
   
   # Restart pods
   kubectl rollout restart deployment/mysql -n ticket-booking
   kubectl rollout restart deployment/backend -n ticket-booking
   ```

2. **Invalidate all user sessions** (update JWT_SECRET)
3. **Review access logs** for suspicious activity
4. **Notify affected users** if necessary

### Regular Security Audits

- Review access logs monthly
- Update dependencies weekly
- Scan for vulnerabilities continuously
- Conduct penetration testing quarterly

## Compliance

### Data Protection (GDPR, CCPA)

- Implement data retention policies
- Add user data export functionality
- Provide account deletion capability
- Maintain audit trails

### PCI DSS (if handling payments)

- Never store credit card data
- Use certified payment gateways
- Implement secure communication
- Regular security assessments

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security Best Practices](https://react.dev/learn/security)

## Contact

For security issues, please report responsibly by contacting the security team.
