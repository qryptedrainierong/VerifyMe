# Verification flow (OIDC-style)

Conceptual end-to-end flow for organization-integrated identity verification. **No** cryptographic algorithms or internal Verification Service implementation details are specified here.

For terms, see [`glossary.md`](./glossary.md). For billing, see [`billing-credits.md`](./billing-credits.md).

## Sequence

1. **Authorize**  
   The organization starts an OIDC-style **`/authorize`** request (browser or trusted system) toward VerifyMe with registered `client_id`, `redirect_uri`, `state`, and MVP scope **`openid`** only. **Future** scopes (e.g. profile) are out of MVP and must be labeled as future in product and docs.

2. **Challenge to the VerifyMe User**  
   The end-user receives a challenge. **OTP** material is derived from **`Transaction_Code`** (and related device-bound state); **raw OTP, passcode, or biometric samples are not** stored or shown in admin surfaces.

3. **VerifyMe app**  
   The **VerifyMe User** completes **passcode + OTP + biometric** steps in the **VerifyMe mobile app** (onboarding is app-only for MVP per [`end-user-management.md`](./end-user-management.md)).

4. **One-time token**  
   The app produces a **one-time** short token (e.g. six characters) for the live session. This is **not** documented as persisted in plaintext in admin databases or displayed in full in either admin portal.

5. **Verification Page**  
   An **organization representative** enters that token on the **VerifyMe Verification Page**.

6. **Handle Authorization**  
   VerifyMe validates the token **before** any success redirect. If validation fails, the flow does **not** return a successful **auth_code** to the organization.

7. **Success redirect**  
   On success, the user agent is sent to the registered **`redirect_uri`** with **`auth_code`**, **`state`**, and the same **`redirect_uri`** context as agreed in the authorize step—**after** validation succeeds.

8. **`/token` exchange**  
   The organization backend exchanges the **auth_code** for **`token_type`**, **`access_token`**, **`id_token`**, **`expires_in`**, per OIDC-style norms.

9. **MVP token usage**  
   For MVP integrations, **only `id_token`** is the relied-upon artifact for downstream identity use; treat other tokens as optional or future unless product explicitly extends scope.

10. **Rotation**  
    After **successful** verification, **`Encrypted_Auth_Cred`** and **`Transaction_Code`** are **rotated** in **`user_device_secure_state`** (see [`schema-notes.md`](./schema-notes.md)). Raw post-rotation values are not exposed in admin UIs.

## Privacy and storage (authoritative docs rule)

Documentation and UX copy must **not** imply that any of the following are stored or displayed in plaintext in admin portals: raw passcode, OTP, biometric data, generated one-time token, **raw** Encrypted_Auth_Cred, **raw** Transaction_Code, raw **client_secret**, private keys, or **raw encrypted QR payload** contents.
