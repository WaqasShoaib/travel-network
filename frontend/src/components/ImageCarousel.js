import React, { useState } from 'react';
import { Box, CardMedia, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const ImageCarousel = ({ images = [], height = 350 }) => {
    const [index, setIndex] = useState(0);

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images.length) return null;

    return (
        <Box sx={{ position: 'relative', textAlign: 'center', mb: 2 }}>
            <CardMedia
                component="img"
                height={height}
                image={images[index]?.url}
                alt={`Image ${index + 1}`}
                sx={{ borderRadius: 2 }}
            />

            {images.length > 1 && (
                <>
                    <IconButton
                        onClick={handlePrev}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 10,
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>

                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 10,
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                        }}
                    >
                        <ChevronRight />
                    </IconButton>

                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 16,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            px: 1,
                            borderRadius: 1,
                        }}
                    >
                        {index + 1} / {images.length}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default ImageCarousel;
