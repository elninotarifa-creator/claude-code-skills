---
name: heygen-avatar-iv
description: Generar vídeos testimoniales/avatares hablando hiperrealistas con HeyGen Avatar IV (image-to-video, lip-sync perfecto, gestos naturales). Úsalo cuando haya que convertir un retrato + guion en un vídeo vertical 9:16 de una persona hablando con voz española natural. Cubre subida de imagen, endpoint v3/videos, aspect_ratio 9:16, voces es-ES y motion prompts.
---

# HeyGen Avatar IV — receta para vídeos hiperrealistas

Modelo **Avatar IV** de HeyGen: convierte una foto fija + guion en un vídeo de esa
persona hablando, con lip-sync preciso, expresiones y gestos de manos naturales.
Es lo más realista de HeyGen (superior a `talking_photo`/Avatar III, que sale plano
y siempre cuadrado). Para testimoniales UGC con aspecto español es la opción fiable.

## Clave API
`KEY=$(security find-generic-password -s HEYGEN_API_KEY -w)` (keychain, empieza por `sk_V2_`).
Header en todas las llamadas: `X-Api-Key: $KEY`.

## Flujo (3 pasos)

### 1. Subir la foto como asset
```bash
curl -s -X POST "https://upload.heygen.com/v1/asset" \
  -H "X-Api-Key: $KEY" -H "Content-Type: image/jpeg" \
  --data-binary "@retrato.jpg"
# -> data.id  (== asset_id) ; también devuelve data.url y data.image_key
```
Foto de calidad = más realismo. Vale frontal, ligeramente girada o de perfil.

### 2. Generar el vídeo — endpoint MODERNO `v3/videos`
IMPORTANTE: usar **`v3/videos`**, NO el legacy `v2/video/av4/generate`.
El legacy IGNORA el aspect ratio y SIEMPRE saca 720x720 cuadrado. Solo `v3/videos`
respeta `aspect_ratio:"9:16"` (vertical real 720x1280 / 1080x1920).

```bash
curl -s -X POST "https://api.heygen.com/v3/videos" \
  -H "X-Api-Key: $KEY" -H "Content-Type: application/json" \
  -d '{
    "type": "image",
    "image": { "type": "asset_id", "asset_id": "<ASSET_ID>" },
    "script": "<texto del guion, números escritos en palabras>",
    "voice_id": "<VOICE_ID es-ES>",
    "voice_settings": { "locale": "es-ES", "speed": 0.96 },
    "aspect_ratio": "9:16",
    "resolution": "1080p",
    "motion_prompt": "<descripción de gestos naturales>"
  }'
# -> data.video_id
```
Notas de esquema (aprendidas a la fuerza):
- `script` es **string** (no objeto).
- `image` es **objeto** `{type:"asset_id",asset_id}` o `{type:"url",url}`.
- `locale` NO va en la raíz → va dentro de `voice_settings`.
- `aspect_ratio`: `"auto"|"16:9"|"9:16"|"4:5"|"5:4"|"1:1"`. `resolution`: `"720p"|"1080p"|"4k"`.
- Coste ≈ 0,05 $/seg.

### 3. Poll y descarga
```bash
curl -s "https://api.heygen.com/v1/video_status.get?video_id=<VID>" -H "X-Api-Key: $KEY"
# data.status: waiting|processing|completed|failed ; al completar -> data.video_url (caduca)
```

## Voz — español de España, natural (no robótico)
Endpoint de voces: `GET https://api.heygen.com/v2/voices`. Filtrar `language` Spanish
con `support_locale:true` y pasar `voice_settings.locale:"es-ES"` para forzar acento de España.
`speed` 0.94–0.98 suena más humano (1.0 va algo acelerado/locución).

Voces es-ES conversacionales ya probadas:
- Lively Laura – Friendly `5fbecc8a2585441aab29ca46a5cd9356` (mujer joven, cálida)
- Camila Vega – Friendly `1eca26cb214c4f66976339251282b341` (mujer joven)
- Social Santiago `3c8cb6e8914349f88993f4f9194efb8d` (hombre, cercano UGC)
- Lucía Ortega `7e5eebc368ab477a9175b7d2a2c3317e` (mujer, neutra)
- David Martin `5d29644883bf4359b4d561a5db2dd740` (hombre)

Truco: escribir los números en palabras ("veinticuatro horas", "cuarenta y nueve euros")
y usar puntuación/puntos suspensivos para marcar pausas naturales.

## Motion prompt — gestos realistas
Describir en español, concreto y breve: edad+nacionalidad, tono, gestos de manos y cabeza,
sonrisa, mirada a cámara, estilo (selfie UGC / testimonio de oficina), luz natural. Ej.:
> "mujer joven española de unos veinticinco años hablando a cámara con ilusión y naturalidad,
> sonrisa espontánea, ligeros gestos con las manos, pequeños movimientos de cabeza, mirada
> directa, estilo selfie UGC, luz natural de interior"

## Casting (regla del CEO)
Personas que se vean españolas/mediterráneas (tipo Madrid): piel clara, rasgos europeos.
NO personas de otras etnias. Los retratos se generan con ChatGPT (Safari) — ver
[[feedback-herramientas-creatividad]] y [[reference-heygen-lipsync]].

## Errores comunes
- Vídeo cuadrado 720x720 → estás usando el endpoint legacy `av4/generate`; cambia a `v3/videos`.
- `"Field required: image"` → falta el objeto `image` (no uses `image_asset_id` suelto en v3).
- `"Extra inputs are not permitted: locale"` → mueve `locale` dentro de `voice_settings`.
- `"script should be a valid string"` → manda `script` como string, no `{text:...}`.
